import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import countriesLib from 'i18n-iso-countries'
import english from 'i18n-iso-countries/langs/en.json'
import { useForm } from 'react-hook-form'
import z from 'zod'

import {
  ComboboxField,
  FileField,
  FormModal,
  TextField,
  createDefaultValues,
  fileValueSchema,
  toast
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

countriesLib.registerLocale(english)

const countryOptions = Object.keys(countriesLib.getNames('en')).map(code => ({
  text: countriesLib.getName(code, 'en') || code,
  value: code.toLowerCase()
}))

const lineValidationSchema = z.object({
  color: z.string(),
  name: z.string(),
  code: z.string(),
  path: z.array(z.array(z.number()))
})

const stationValidationSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  name: z.string(),
  lines: z.array(z.string()),
  type: z.enum(['station', 'interchange']),
  codes: z.array(z.string()).optional(),
  textOffsetX: z.number().optional(),
  textOffsetY: z.number().optional(),
  textAnchor: z.string().optional()
})

const mapFileSchema = z.object({
  mrtLines: z.array(lineValidationSchema),
  mrtStations: z.array(stationValidationSchema)
})

const schema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  file: fileValueSchema
})

function ModifyMapModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      file: { type: 'empty' as const }
    },
    resolver: zodResolver(schema)
  })

  const createMutation = useMutation(
    forgeAPI.maps.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: forgeAPI.maps.list.key })
        toast.success('Map created successfully')
      },
      onError: () => {
        toast.error('Failed to create map')
      }
    })
  )

  return (
    <FormModal
      form={form}
      submissionConfig={{
        template: 'create',
        handler: async formData => {
          const fileValue = formData.file

          if (fileValue.type !== 'upload') {
            toast.error('Please select a JSON map data file')

            return
          }

          const text = await fileValue.file.text()

          let json: unknown

          try {
            json = JSON.parse(text)
          } catch {
            toast.error('Invalid JSON file')

            return
          }

          const parsed = mapFileSchema.safeParse(json)

          if (!parsed.success) {
            toast.error(
              `Invalid map data: ${parsed.error.issues.map(i => `${i.path}: ${i.message}`).join(', ')}`
            )

            throw new Error()
          }

          await createMutation.mutateAsync({
            name: formData.name,
            country: formData.country,
            lines: parsed.data.mrtLines,
            stations: parsed.data.mrtStations
          })
        }
      }}
      uiConfig={{
        icon: 'tabler:plus',
        onClose,
        title: 'map.create',
        namespace: 'apps.railwayMap'
      }}
    >
      <TextField
        autoFocus
        required
        control={form.control}
        icon="tabler:map"
        label="modifyMap.name"
        name="name"
        placeholder="Singapore MRT Map"
      />
      <ComboboxField
        required
        control={form.control}
        icon="tabler:flag"
        label="modifyMap.country"
        name="country"
        options={countryOptions}
      />
      <FileField
        required
        control={form.control}
        icon="tabler:file-code"
        label="modifyMap.file"
        mimeTypes={{ application: ['json'] }}
        name="file"
      />
    </FormModal>
  )
}

export default ModifyMapModal
