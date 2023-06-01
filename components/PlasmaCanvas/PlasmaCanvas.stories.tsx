import React, { ComponentProps } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import PlasmaCanvas from './PlasmaCanvas'

export default {
  title: 'Animations/PlasmaCanvas',
  component: PlasmaCanvas
} as ComponentMeta<typeof PlasmaCanvas>

const Template: ComponentStory<typeof PlasmaCanvas> = (
  args: ComponentProps<typeof PlasmaCanvas>
) => <PlasmaCanvas {...args} />

export const Default = Template.bind({})
Default.args = {
  componentName: 'plasma-body',
  isLight: false,
  className: 'w-full h-full'
}

export const Light = Template.bind({})
Light.args = {
  componentName: 'plasma-footer',
  isLight: true,
  className: 'w-full h-full'
}
