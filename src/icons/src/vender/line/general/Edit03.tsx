// GENERATE BY script
// DON NOT EDIT IT MANUALLY

import * as React from 'react'
import data from './Edit03.json'
import IconBase from '@/icons/IconBase'
import type { IconBaseProps, IconData } from '@/icons/IconBase'

const Icon = React.forwardRef<React.MutableRefObject<SVGElement>, Omit<IconBaseProps, 'data'>>((
  props,
  ref,
) => <IconBase {...props} ref={ref} data={data as unknown as IconData} />)

Icon.displayName = 'Edit03'

export default Icon
