export interface ColorInfo {
  hex: string;
  name: string;
}

export interface Analysis {
  id?: string;
  userId: string;
  season: 'Winter' | 'Spring' | 'Summer' | 'Autumn';
  subType: string;
  bestColors: ColorInfo[];
  avoidColors: ColorInfo[];
  jewelry: 'Gold' | 'Silver';
  faceShape: string;
  faceShapeDescription: string;
  skinUndertone: string;
  eyeColor: string;
  hairColor: string;
  imageUrl?: string;
  cleanedImageUrl?: string;
  createdAt: any;
}
