import { lazy } from 'react'

import { createForgeModule } from '@lifeforge/federation'

import type { Contract } from './contract'

const { forgeAPI, ...manifest } = createForgeModule<Contract>({
  routes: {
    '/': lazy(() => import('@/pages/MapList')),
    '/map/:id': lazy(() => import('@/pages/MapView'))
  }
})

export default manifest

export { forgeAPI }
