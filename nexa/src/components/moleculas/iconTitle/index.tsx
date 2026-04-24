import React from 'react'
import Icon from '@/components/atoms/icon'
import {
  HeroTitle,
  MediumTitle,
  SubTitle,
  BigText,
  SmallText,
  MidText,
  SubTexto,
  SubTextoMini,
} from '@/components/atoms/heroTitles'

type IconTitleVariant =
  | 'hero'
  | 'medium'
  | 'subtitle'
  | 'big'
  | 'mid'
  | 'small'
  | 'sub'
  | 'mini'

interface IconTitleProps {
  text: string;
  nameIcon?: string;
  variant?: IconTitleVariant;
  textStyle?: React.CSSProperties;
}

const textVariants: Record<IconTitleVariant, React.ComponentType<{ text: string; style?: React.CSSProperties }>> = {
  hero: HeroTitle,
  medium: MediumTitle,
  subtitle: SubTitle,
  big: BigText,
  mid: MidText,
  small: SmallText,
  sub: SubTexto,
  mini: SubTextoMini,
}

const Index = ({ text, nameIcon, variant = 'small', textStyle }: IconTitleProps) => {
  const TextComponent = textVariants[variant] || SmallText

  return (
    <div className='flex items-center gap-2'>
      {nameIcon ? <Icon name={nameIcon} /> : null}
      <TextComponent text={text} style={textStyle} />
    </div>
  )
}

export default Index