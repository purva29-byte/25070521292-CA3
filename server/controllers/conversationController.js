import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Listing } from '../models/Listing.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { publicSeller } from '../utils/serializers.js';

function conversationKey(listingId, userA, userB) {
  const pair = [String(userA), String(userB)].sort().join(':');
  return `${listingId}:${pair}`;
}

async function requireConversation(id, userId) {
  const conversation = await Conversation.findById(id);
  if (!conversation) throw new ApiError(404, 'Conversation not found.', { code: 'CONVERSATION_NOT_FOUND' });
  if (!conversation.participants.some((participant) => String(participant) === String(userId))) {
    throw new ApiError(403, 'You do not have access to this conversation.', {
      code: 'NOT_PARTICIPANT',
    });
  }
  return conversation;
}

function serializeConversation(conversation, userId, unreadCount = 0) {
  const source = conversation.toObject ? conversation.toObject() : conversation;
  return {
    id: String(source._id),
    participants: (source.participants || []).map((participant) =>
      participant?._id ? publicSeller(participant) : { id: String(participant) }
    ),
    listing: source.listing
      ? {
          id: String(source.listing._id),
          title: source.listing.title,
          price: source.listing.price,
          images: source.listing.images,
          status: source.listing.status,
        }
      : null,
    lastMessage: source.lastMessage,
    lastMessageAt: source.lastMessageAt,
    unreadCount,
    otherParticipant: (source.participants || [])
      .map((participant) => (participant?._id ? publicSeller(participant) : null))
      .find((participant) => participant && participant.id !== String(userId)) || null,
  };
}

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .populate({ path: 'participants', select: 'name college department year createdAt' })
    .populate({ path: 'listing', select: 'title price images status seller' })
    .lean();

  const ids = conversations.map((conversation) => conversation._id);
  const unread = await Message.aggregate([
    {
      $match: {
        conversation: { $in: ids },
        sender: { $ne: req.user._id },
        readAt: null,
      },
    },
    { $group: { _id: '$conversation', count: { $sum: 1 } } },
  ]);
  const unreadMap = new Map(unread.map((item) => [String(item._id), item.count]));

  return res.json({
    success: true,
    data: {
      conversations: conversations.map((conversation) =>
        serializeConversation(conversation, req.user._id, unreadMap.get(String(conversation._id)) || 0)
      ),
    },
  });
});

export const createConversation = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.body.listingId).populate({
    path: 'seller',
    select: 'name college department year createdAt',
  });

  if (!listing || !['approved', 'sold'].includes(listing.status)) {
    throw new ApiError(404, 'Listing not found.', { code: 'LISTING_NOT_FOUND' });
  }
  if (!listing.seller) {
    throw new ApiError(404, 'Seller profile is unavailable.', { code: 'SELLER_NOT_FOUND' });
  }
  if (String(listing.seller._id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot start a conversation about your own listing.', {
      code: 'CANNOT_MESSAGE_SELF',
    });
  }

  const key = conversationKey(listing._id, req.user._id, listing.seller._id);

  let conversation = await Conversation.findOne({ participantKey: key });
  let created = false;

  if (!conversation) {
    try {
      conversation = await Conversation.create({
        participants: [req.user._id, listing.seller._id],
        listing: listing._id,
        participantKey: key,
        lastMessage: '',
        lastMessageAt: new Date(),
      });
      created = true;
    } catch (error) {
      if (error.code === 11000) {
        conversation = await Conversation.findOne({ participantKey: key });
      } else {
        throw error;
      }
    }
  }

  const populated = await Conversation.findById(conversation._id)
    .populate({ path: 'participants', select: 'name college department year createdAt' })
    .populate({ path: 'listing', select: 'title price images status seller' })
    .lean();

  return res.status(created ? 201 : 200).json({
    success: true,
    data: { conversation: serializeConversation(populated, req.user._id) },
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  const conversation = await requireConversation(req.params.id, req.user._id);
  const messages = await Message.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .limit(300)
    .populate({ path: 'sender', select: 'name' })
    .lean();

  return res.json({
    success: true,
    data: {
      messages: messages.map((message) => ({
        id: String(message._id),
        text: message.text,
        sender: {
          id: String(message.sender?._id || message.sender),
          name: message.sender?.name || 'Student',
        },
        isMine: String(message.sender?._id || message.sender) === String(req.user._id),
        readAt: message.readAt,
        createdAt: message.createdAt,
      })),
      conversation: {
        id: String(conversation._id),
        listingId: String(conversation.listing),
      },
    },
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await requireConversation(req.params.id, req.user._id);

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    text: req.body.text,
  });

  conversation.lastMessage = req.body.text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  return res.status(201).json({
    success: true,
    data: {
      message: {
        id: String(message._id),
        text: message.text,
        sender: { id: String(req.user._id), name: req.user.name },
        isMine: true,
        readAt: null,
        createdAt: message.createdAt,
      },
    },
  });
});

export const markConversationRead = asyncHandler(async (req, res) => {
  const conversation = await requireConversation(req.params.id, req.user._id);
  const result = await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.user._id }, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return res.json({
    success: true,
    data: { markedRead: result.modifiedCount },
  });
});
