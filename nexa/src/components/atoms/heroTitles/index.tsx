import React from "react";

interface TextProps {
  text: string;
  style?: React.CSSProperties;
  className?: string;
}

interface BaseTextProps extends TextProps {
  as?: keyof React.JSX.IntrinsicElements;
}

const TextBase = ({ text, style, className = "", as = "p" }: BaseTextProps) => {
  const Component = as;

  return (
    <Component className={className.trim()} style={style}>
      {text}
    </Component>
  );
};

const HeroTitle = ({ text, style, className = "" }: TextProps) => {
  return <TextBase as="h1" text={text} style={style} className={`text-[clamp(2.1rem,5vw,3.5rem)] ${className}`} />;
};

const MediumTitle = ({ text, style, className = "" }: TextProps) => {
  return <TextBase as="h2" text={text} style={style} className={`text-[clamp(1.9rem,4vw,2.5rem)] ${className}`} />;
};

const SubTitle = ({ text, style, className = "" }: TextProps) => {
  return <TextBase as="h3" text={text} style={style} className={`text-[clamp(1.35rem,3vw,1.75rem)] ${className}`} />;
};

const BigText = ({ text, style, className = "" }: TextProps) => {
  return <TextBase text={text} style={style} className={`text-[clamp(1.2rem,2.4vw,1.56rem)] ${className}`} />;
};

const MidText = ({ text, style, className = "" }: TextProps) => {
  return <TextBase text={text} style={style} className={`text-[clamp(1.1rem,2vw,1.37rem)] ${className}`} />;
};

const SmallText = ({ text, style, className = "" }: TextProps) => {
  return <TextBase text={text} style={style} className={`text-[clamp(1rem,1.7vw,1.12rem)] ${className}`} />;
};

const SubTexto = ({ text, style, className = "" }: TextProps) => {
  return <TextBase text={text} style={style} className={`text-[14px] ${className}`} />;
};

const SubTextoMini = ({ text, style, className = "" }: TextProps) => {
  return <TextBase text={text} style={style} className={`text-[12px] ${className}`} />;
};

export { HeroTitle, MediumTitle, BigText, SubTitle, SmallText, MidText, SubTexto, SubTextoMini };
