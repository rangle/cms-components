import React, { ComponentProps } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Image } from './Image';

export default {
  title: 'Components/Image',
  component: Image,
} as ComponentMeta<typeof Image>;

const Template: ComponentStory<typeof Image> = (
  args: ComponentProps<typeof Image>
) => <Image {...args} />;

export const AllOptions = Template.bind({});
AllOptions.args = {
  image:
    'https://cdn.sanity.io/images/bhgv5hzu/production/ad273226e0d173fffa63471e379db10ad22b11f1-6000x4000.jpg',
  alt: '',
};
