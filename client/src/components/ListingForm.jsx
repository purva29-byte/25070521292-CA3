import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';
import { CATEGORIES, CONDITIONS } from '../utils/constants.js';
import { getApiError, getFieldErrors } from '../services/api.js';
import { cn } from '../lib/cn.js';

const defaults = {
  title: '',
  description: '',
  category: '',
  condition: 'good',
  price: '',
  college: '',
  pickupLocation: '',
  isNegotiable: false,
};

export default function ListingForm({ mode = 'create', initialListing = null, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaults });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(initialListing?.images || []);
  const [generalError, setGeneralError] = useState('');
  const description = watch('description', '');
  const isNegotiable = watch('isNegotiable');

  useEffect(() => {
    if (!initialListing) return;
    reset({
      title: initialListing.title || '',
      description: initialListing.description || '',
      category: initialListing.category || '',
      condition: initialListing.condition || 'good',
      price: initialListing.price ?? '',
      college: initialListing.college || '',
      pickupLocation: initialListing.pickupLocation || '',
      isNegotiable: Boolean(initialListing.isNegotiable),
    });
    setExistingImages(initialListing.images || []);
  }, [initialListing, reset]);

  async function submit(values) {
    setGeneralError('');
    const totalImages = files.length + existingImages.length;
    if (totalImages === 0) {
      setError('images', { message: 'Add at least one photo of the item.' });
      return;
    }
    if (totalImages > 6) {
      setError('images', { message: 'A listing can have at most 6 images.' });
      return;
    }
    clearErrors('images');

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('description', values.description.trim());
    formData.append('category', values.category);
    formData.append('condition', values.condition);
    formData.append('price', String(values.price));
    formData.append('college', values.college.trim());
    formData.append('pickupLocation', values.pickupLocation.trim());
    formData.append('isNegotiable', String(Boolean(values.isNegotiable)));
    formData.append('keptImages', JSON.stringify(existingImages));
    files.forEach((file) => formData.append('images', file));

    try {
      await onSubmit(formData);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        const mapped = field === 'keptImages' ? 'images' : field;
        setError(mapped, { type: 'server', message });
      });
      if (fieldErrors.images) setError('images', { type: 'server', message: fieldErrors.images });
      setGeneralError(getApiError(error, 'Could not save the listing. Please try again.'));
    }
  }

  const inputClass = (field) => cn('field-input', errors[field] && 'border-red-400 focus:border-red-500');

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8" noValidate>
      {generalError && (
        <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{generalError}</p>
        </div>
      )}

      <section className="card p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Item details</h2>
          <p className="mt-1 text-sm text-muted">Be clear about what the student is getting.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="field-label">
              Item title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Casio FX-991EX scientific calculator"
              className={inputClass('title')}
              maxLength={120}
              {...register('title', {
                required: 'Add an item title.',
                minLength: { value: 4, message: 'Title must be at least 4 characters.' },
                maxLength: { value: 120, message: 'Title cannot exceed 120 characters.' },
              })}
            />
            {errors.title && <p className="field-error">{errors.title.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <span className="text-[11px] text-muted">{description.length}/3000</span>
            </div>
            <textarea
              id="description"
              rows={6}
              maxLength={3000}
              placeholder="Describe the condition, what is included, any marks or missing pieces, and why you are selling it."
              className={cn(inputClass('description'), 'resize-y leading-6')}
              {...register('description', {
                required: 'Add a description.',
                minLength: { value: 20, message: 'Description must be at least 20 characters.' },
                maxLength: { value: 3000, message: 'Description cannot exceed 3000 characters.' },
              })}
            />
            {errors.description && <p className="field-error">{errors.description.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="field-label">
                Category
              </label>
              <select
                id="category"
                className={inputClass('category')}
                {...register('category', { required: 'Choose a category.' })}
              >
                <option value="">Choose a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>

            <div>
              <label htmlFor="price" className="field-label">
                Price (₹)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                  ₹
                </span>
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="1000000"
                  step="1"
                  placeholder="0"
                  className={cn(inputClass('price'), 'pl-7')}
                  {...register('price', {
                    required: 'Add a price. Enter 0 if it is free.',
                    min: { value: 0, message: 'Price cannot be negative.' },
                    max: { value: 1000000, message: 'Price cannot exceed ₹10,00,000.' },
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.price && <p className="field-error">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <span className="field-label">Condition</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONDITIONS.map((condition) => (
                <label
                  key={condition.value}
                  className={cn(
                    'cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition',
                    'has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-800',
                    'border-line bg-white text-ink/70 hover:border-forest-200'
                  )}
                >
                  <input
                    type="radio"
                    value={condition.value}
                    className="sr-only"
                    {...register('condition', { required: true })}
                  />
                  {condition.label}
                </label>
              ))}
            </div>
            {errors.condition && <p className="field-error">Choose a condition.</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas/60 p-3.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line text-forest-600 focus:ring-forest-500"
              {...register('isNegotiable')}
            />
            <span>
              <span className="block text-sm font-medium">Price is negotiable</span>
              <span className="mt-0.5 block text-xs text-muted">
                Buyers can still message you either way.
              </span>
            </span>
          </label>
          {isNegotiable && null}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Photos</h2>
          <p className="mt-1 text-sm text-muted">
            Photos help students judge condition. The first photo appears in search results.
          </p>
        </div>
        <ImageUploader
          files={files}
          onFilesChange={setFiles}
          existingImages={existingImages}
          onRemoveExisting={(image) =>
            setExistingImages((current) => current.filter((item) => item !== image))
          }
          disabled={isSubmitting}
          error={errors.images?.message}
        />
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Campus and pickup</h2>
          <p className="mt-1 text-sm text-muted">
            Keep it to a general campus area. You will arrange the exact meeting point in chat.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="college" className="field-label">
              Campus or college
            </label>
            <input
              id="college"
              type="text"
              placeholder="e.g. Fergusson College"
              className={inputClass('college')}
              {...register('college', {
                required: 'Add your campus or college.',
                minLength: { value: 2, message: 'College name must be at least 2 characters.' },
                maxLength: { value: 120, message: 'College name cannot exceed 120 characters.' },
              })}
            />
            {errors.college && <p className="field-error">{errors.college.message}</p>}
          </div>
          <div>
            <label htmlFor="pickupLocation" className="field-label">
              Pickup area <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="pickupLocation"
              type="text"
              placeholder="e.g. Central library entrance"
              className={inputClass('pickupLocation')}
              maxLength={120}
              {...register('pickupLocation', {
                maxLength: { value: 120, message: 'Pickup location cannot exceed 120 characters.' },
              })}
            />
            {errors.pickupLocation && <p className="field-error">{errors.pickupLocation.message}</p>}
          </div>
        </div>
        <div className="mt-5 flex gap-2.5 rounded-xl bg-forest-50 p-3 text-xs leading-5 text-forest-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Meet in a busy, well-lit campus space. Never share OTPs, passwords, or banking details.
          </p>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary min-w-44 py-3" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? 'Saving…'
            : mode === 'edit'
              ? 'Save and submit for review'
              : 'Submit listing for review'}
        </button>
      </div>
      <p className="text-center text-[11px] leading-5 text-muted sm:text-right">
        Listings are reviewed by a moderator before they appear publicly.
      </p>
    </form>
  );
}
