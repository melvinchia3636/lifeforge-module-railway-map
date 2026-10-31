import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { Box, Button, Flex, ModalHeader, Text, toast } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import type { Sign } from '..'
import PerspectiveEditor, {
  type Coords,
  validateCoords
} from './PerspectiveEditor'

function EditSignPhotoModal({
  onClose,
  data: { sign }
}: {
  onClose: () => void
  data: { sign: Sign }
}) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  
const [coords, setCoords] = useState<Coords | null>(null)

  useEffect(() => {
    if (!sign.image) return

    const imageUrl = forgeAPI.getMedia({ key: sign.image })

    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `sign-${sign.id}.png`, {
          type: blob.type || 'image/png'
        })

        setImageFile(file)

        const reader = new FileReader()

        reader.onload = () => {
          const url = reader.result as string
          const img = new Image()

          img.onload = () => {
            const w = img.naturalWidth
            const h = img.naturalHeight

            setImageDimensions({ width: w, height: h })
            setImageDataUrl(url)
            setCoords(
              (sign.crop_coords as any) || {
                topLeft: { x: w * 0.15, y: h * 0.15 },
                topRight: { x: w * 0.85, y: h * 0.15 },
                bottomRight: { x: w * 0.85, y: h * 0.85 },
                bottomLeft: { x: w * 0.15, y: h * 0.85 }
              }
            )
            setImageLoading(false)
          }
          img.src = url
        }
        reader.readAsDataURL(file)
      })
      .catch(() => {
        toast.error('Failed to load sign image')
        setImageLoading(false)
      })
  }, [])

  const updateMutation = useMutation(
    forgeAPI.signs.update.input({ id: sign.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: forgeAPI.signs.list.key
        })
        onClose()
        toast.success('Sign updated successfully')
      },
      onError: () => {
        toast.error('Failed to update sign')
      }
    })
  )

  const handleSubmit = useCallback(async () => {
    if (!imageFile || !coords || !imageDimensions) return

    const validationError = validateCoords(
      coords,
      imageDimensions.width,
      imageDimensions.height
    )

    if (validationError) {
      toast.error(validationError)

      return
    }

    setLoading(true)

    try {
      await updateMutation.mutateAsync({
        image: imageFile,
        coords
      } as never)
    } finally {
      setLoading(false)
    }
  }, [imageFile, coords, imageDimensions, updateMutation])

  return (
    <Box minWidth="60vw">
      <ModalHeader
        icon="tabler:pencil"
        title="Edit Sign Photo"
        onClose={onClose}
      />
      {imageLoading ? (
        <Flex centered p="2xl">
          <Text color="muted">Loading image...</Text>
        </Flex>
      ) : imageDataUrl && imageDimensions && coords ? (
        <>
          <Flex align="center" gap="sm" mb="md">
            <Text color="muted" size="sm">
              Drag the four corner points to match the sign edges
            </Text>
          </Flex>
          <PerspectiveEditor
            coords={coords}
            imageDataUrl={imageDataUrl}
            imageHeight={imageDimensions.height}
            imageWidth={imageDimensions.width}
            onCoordsChange={setCoords}
          />

          <Button loading={loading} mt="lg" width="100%" onClick={handleSubmit}>
            Save
          </Button>
        </>
      ) : null}
    </Box>
  )
}

export default EditSignPhotoModal
