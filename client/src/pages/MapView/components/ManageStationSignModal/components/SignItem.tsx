import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  Card,
  ConfirmationModal,
  ContextMenu,
  ContextMenuItem,
  Flex,
  Image,
  Text,
  surface,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'
import LineBadge from '@/pages/MapView/components/LineBadge'
import { getLineColor } from '@/utils/getLineColor'

import type { Sign } from '../index'
import EditSignPhotoModal from './EditSignPhotoModal'

function SignItem({
  sign,
  lines
}: {
  sign: Sign
  lines: { code: string; color: string }[]
}) {
  const { open } = useModalStore()
  const queryClient = useQueryClient()
  
const deleteSignMutation = useMutation(
    forgeAPI.signs.remove.input({ id: sign.id }).mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: forgeAPI.signs.list.key })
      }
    })
  )

  return (
    <Card key={sign.id} bg={surface.light} gap="md">
      <Flex align="center" justify="between">
        <Flex align="center" gap="sm">
          <LineBadge
            code={sign.station_code}
            color={getLineColor(sign.station_code, lines)}
          />
          <Text size="xl" weight="medium">
            {new Date(sign.created).toLocaleDateString()}
          </Text>
        </Flex>
        <ContextMenu>
          <ContextMenuItem
            icon="tabler:pencil"
            label="edit"
            onClick={() => open(EditSignPhotoModal, { sign })}
          />
          <ContextMenuItem
            dangerous
            icon="tabler:trash"
            label="delete"
            onClick={() =>
              open(ConfirmationModal, {
                confirmationButton: 'delete',
                description: 'Are you sure you want to delete this sign photo?',
                onConfirm: async () => {
                  await deleteSignMutation.mutateAsync(undefined)
                },
                title: 'Delete Sign'
              })
            }
          />
        </ContextMenu>
      </Flex>
      <Image
        alt=""
        fallback="tabler:photo"
        fit="contain"
        flexShrink="0"
        overflow="hidden"
        r="md"
        src={
          sign.cropped_image
            ? forgeAPI.getMedia({ key: sign.cropped_image })
            : undefined
        }
        width="100%"
      />
    </Card>
  )
}

export default SignItem
