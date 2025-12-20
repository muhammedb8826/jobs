export type HeroButton = {
  id: number;
  title: string;
  url: string;
  isExternal: boolean;
};

export type HeroCard = {
  id: number;
  icon: {
    width: number;
    height: number;
    iconData: string;
    iconName: string;
    isSvgEditable: boolean;
    isIconNameEditable: boolean;
  };
  title: string;
  description: string;
};

export type HeroSection = {
  id: number;
  heading: string;
  subHeading: string;
  description: string;
  buttons: HeroButton[];
  cards: HeroCard[];
};

