import type { InferOutput } from '@lifeforge/api'
import { Box, Flex, type FlexProps, Stack, ZoomableImage } from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import { getLineColor } from '@/utils/getLineColor'

import { useStationsTabContext } from '../contexts/StationsTabContext'

type SignImage = InferOutput<typeof forgeAPI.signs.list>[number]

function SignImages({
  signs,
  lines,
  hasMaxWidth,
  ...stackProps
}: {
  signs: SignImage[]
  lines: { code: string; color: string }[]
  hasMaxWidth?: boolean
} & FlexProps) {
  const { showOriginalImage } = useStationsTabContext()

  return (
    <Stack width="auto" {...stackProps}>
      {signs.map(sign => {
        const imageKey = showOriginalImage ? sign.image : sign.cropped_image

        return (
          <Flex
            key={sign.id}
            gap="sm"
            maxWidth={hasMaxWidth ? '24em' : undefined}
            minHeight="2.5rem"
            width={hasMaxWidth ? 'auto' : '100%'}
          >
            <Box
              r="full"
              style={{
                backgroundColor: getLineColor(sign.station_code, lines),
                alignSelf: 'stretch'
              }}
              width="4px"
            />
            <ZoomableImage
              alt=""
              fallback="tabler:photo"
              fit="contain"
              height="100%"
              r="sm"
              src={imageKey ? forgeAPI.getMedia({ key: imageKey }) : undefined}
              style={{
                alignSelf: 'stretch'
              }}
              width="100%"
            />
          </Flex>
        )
      })}
    </Stack>
  )
}

export default SignImages
