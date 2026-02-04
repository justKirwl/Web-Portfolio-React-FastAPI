import Cropper, { type Area } from 'react-easy-crop'
import { useImageCropStore } from '../stores/ImageCropStore'
import { useEffect } from 'react'
import { Check, LoaderCircle } from 'lucide-react'
import { useTranslation } from '../../node_modules/react-i18next'

export default function CropperModal() {
  const { imageUrl, zoomInit , cropInit, aspectInit, setCrop, setZoom, setAspect, setImageUrl, resetSettings, setCroppedAreaPixels, onCrop, isAvatarChanged, isLoading } = useImageCropStore()
  const { t } = useTranslation()

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  useEffect(() => {
    if (isAvatarChanged) {
      setTimeout(() => {
        useImageCropStore.setState(state => ({ ...state, isAvatarChanged: false }))
        setImageUrl(null)
        resetSettings()
      }, 3000)
    }
  }, [isAvatarChanged])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div className="absolute inset-0 bg-[var(--color-base-100)] opacity-60"></div>

      <div className="relative w-[90%] max-w-3xl rounded-lg shadow-lg overflow-hidden bg-[var(--color-base-200)]">
        <div className="relative w-full h-[400px] bg-[var(--color-neutral)]">
          <Cropper
            aspect={aspectInit}
            image={imageUrl}
            zoom={zoomInit}
            crop={cropInit}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-4 space-y-4 bg-[var(--color-base-300)] text-[var(--color-base-content)]">

          <div>
            <label className="block mb-2">{t('cropperModal.zoom')}</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoomInit}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block mb-2">{t('cropperModal.aspect')}</label>
            <select
              onChange={(e) => setAspect(parseFloat(e.target.value))}
              value={aspectInit}
              className="w-full px-3 py-2 rounded-md bg-[var(--color-neutral)] text-[var(--color-neutral-content)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value={4 / 3}>4 / 3</option>
              <option value={16 / 9}>16 / 9</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setImageUrl(null)
                resetSettings()
              }}
              className="px-4 py-2 rounded-md bg-[var(--color-neutral)] text-[var(--color-neutral-content)] hover:bg-[var(--color-base-200)]"
            >
              {t('cropperModal.cancel')}
            </button>
            <button
              onClick={resetSettings}
              className="px-4 py-2 rounded-md bg-[var(--color-warning)] text-[var(--color-warning-content)] hover:bg-[var(--color-warning-content)] hover:text-[var(--color-warning)]"
            >
              {t('cropperModal.reset')}
            </button>
            <button onClick={onCrop} className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-content)]">
              {isLoading ? <LoaderCircle className='w-5 h-5 animate-spin'/> : isAvatarChanged ? <Check className='w-5 h-5'/> : t('cropperModal.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}