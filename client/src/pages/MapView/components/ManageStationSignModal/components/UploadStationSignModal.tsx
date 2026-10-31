import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import {
  Box,
  Button,
  FileInput,
  Flex,
  ListboxInput,
  ListboxOption,
  ModalHeader,
  Stack,
  Text,
  toast,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import LineBadge from '@/pages/MapView/components/LineBadge'
import { getLineColor } from '@/utils/getLineColor'

import PerspectiveEditor, {
  type Coords,
  validateCoords
} from './PerspectiveEditor'

function UploadStationSignModal({
  onClose,
  data: { stationCodes, lines }
}: {
  onClose: () => void
  data: {
    stationCodes: string[]
    lines: { code: string; color: string }[]
  }
}) {
  const { close } = useModalStore()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'select' | 'adjust'>('select')
  const [selectedCode, setSelectedCode] = useState(stationCodes[0] || '')
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  
const [coords, setCoords] = useState<Coords | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (value: { type: string; file?: File }) => {
    if (value.type === 'empty') {
      setImageFile(null)
      setImageDataUrl(null)
      setImageDimensions(null)
      setCoords(null)

      return
    }

    if (value.type === 'upload' && value.file) {
      const reader = new FileReader()

      reader.onload = () => {
        const url = reader.result as string
        const img = new Image()

        img.onload = () => {
          const w = img.naturalWidth
          const h = img.naturalHeight

          setImageDimensions({ width: w, height: h })
          setImageDataUrl(url)
          setImageFile(value.file!)
          setCoords({
            topLeft: { x: w * 0.15, y: h * 0.15 },
            topRight: { x: w * 0.85, y: h * 0.15 },
            bottomRight: { x: w * 0.85, y: h * 0.85 },
            bottomLeft: { x: w * 0.15, y: h * 0.85 }
          })
        }
        img.src = url
      }
      reader.readAsDataURL(value.file)
    }
  }

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
      await forgeAPI.signs.upload.mutate({
        image: imageFile,
        station_code: selectedCode,
        coords
      })
      toast.success('Station sign uploaded successfully')
      queryClient.invalidateQueries({ queryKey: forgeAPI.signs.list.key })
      onClose()
    } catch {
      throw new Error('Failed to upload station sign')
    } finally {
      setLoading(false)
    }
  }, [imageFile, coords, imageDimensions, selectedCode, close, queryClient])

  return (
    <Box minWidth="60vw">
      <ModalHeader
        icon="tabler:camera"
        title="Upload Station Sign"
        onClose={onClose}
      />
      {step === 'select' && (
        <Stack gap="md">
          {stationCodes.length > 1 && (
            <ListboxInput
              icon="tabler:map-pin"
              label="uploadStationSign.stationCode"
              renderContent={() => (
                <LineBadge
                  code={selectedCode}
                  color={getLineColor(selectedCode, lines)}
                />
              )}
              value={selectedCode}
              onChange={setSelectedCode}
            >
              {stationCodes.map(code => (
                <ListboxOption key={code} label={code} value={code} />
              ))}
            </ListboxInput>
          )}
          <FileInput
            icon="tabler:photo"
            label="uploadStationSign.file"
            mimeTypes={{ image: ['png', 'jpeg'] }}
            value={
              imageFile
                ? {
                    file: imageFile,
                    preview: imageDataUrl || undefined,
                    type: 'upload' as const
                  }
                : { type: 'empty' as const }
            }
            onChange={handleFileChange}
          />
          <Button
            disabled={!imageFile}
            loading={loading}
            mt="lg"
            width="100%"
            onClick={() => setStep('adjust')}
          >
            Proceed
          </Button>
        </Stack>
      )}
      {step === 'adjust' && imageDataUrl && imageDimensions && coords && (
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
            Upload
          </Button>
        </>
      )}
    </Box>
  )
}

export default UploadStationSignModal
