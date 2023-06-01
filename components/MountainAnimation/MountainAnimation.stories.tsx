import React, { ComponentProps } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MountainAnimation } from './MountainAnimation'
import { Cta } from '../Cta'

export default {
  title: 'Animations/MountainAnimation',
  component: MountainAnimation
} as ComponentMeta<typeof MountainAnimation>

const Template: ComponentStory<typeof MountainAnimation> = (
  args: ComponentProps<typeof MountainAnimation>
) => <MountainAnimation {...args} />

export const Default = Template.bind({})
Default.args = {
  width: 400,
  height: 400,
  widthSegments: 50,
  heightSegments: 50,
  children: (
    <div>
      <h1 className='text-white text-4xl font-bold capitalize mb-4'>
        Complex Software Delivered With Speed
      </h1>
      <Cta url='https://rangle.io' text='Our Services' hasPrimaryCta={true} />
    </div>
  ),
  bgColor: {
    r: 0.89,
    g: 0.22,
    b: 0.086
  },
  raycastColor: {
    r: 0.831,
    g: 0.271,
    b: 0.153
  }
}
