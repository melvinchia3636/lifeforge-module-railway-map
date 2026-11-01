import dayjs from 'dayjs'

import { Box, Card, Flex, Text, surface } from '@lifeforge/ui'

import LineBadge from '@/pages/MapView/components/LineBadge'

interface LineStatus {
  code: string
  name: string
  color: string
  collected: number
  total: number
  percentage: number
  completedAt?: string
}

function LineStatusCard({ line }: { line: LineStatus }) {
  return (
    <Card
      align={{ base: 'start', md: 'center' }}
      bg={surface.light}
      direction={{ base: 'column', md: 'row' }}
      gap="lg"
      minWidth="0"
    >
      <Flex align="center" gap="sm" minWidth="0" width="100%">
        <LineBadge code={line.code} color={line.color} />
        <Flex direction="column" flex="1" minWidth="0">
          <Text truncate as="p">
            {line.name}
          </Text>
          <Text
            truncate
            as="p"
            color={line.completedAt ? 'green-500' : 'muted'}
            size="sm"
          >
            {line.completedAt
              ? `Completed on ${dayjs(line.completedAt).format('DD/MM/YYYY')}`
              : 'Not completed'}
          </Text>
        </Flex>
      </Flex>
      <Flex
        align="center"
        flexBasis={{ base: '100%', md: '50%' }}
        gap="sm"
        minWidth="0"
        width={{ base: '100%', md: 'auto' }}
      >
        <Box
          bg={{ base: 'bg-200', dark: 'bg-700' }}
          flex="1"
          height="8px"
          overflow="hidden"
          position="relative"
          r="full"
        >
          <Box
            bg={
              line.percentage === 100
                ? 'green-500'
                : line.percentage > 0
                  ? 'custom-500'
                  : 'transparent'
            }
            height="100%"
            left="0"
            position="absolute"
            r="full"
            style={{
              width: `${line.percentage}%`,
              transition: 'width 300ms ease'
            }}
            top="0"
          />
        </Box>
        <Box asChild minWidth="2.5rem">
          <Text align="right" color="muted" size="sm">
            {line.collected}/{line.total}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}

export default LineStatusCard
