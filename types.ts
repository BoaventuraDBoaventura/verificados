
export enum VerificationStatus {
  UNVERIFIED = 'Não Verificado',
  PENDING = 'Em Verificação',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado'
}

export interface Model {
  id: string;
  artisticName: string;
  age: number;
  location: string;
  category: string;
  bio: string;
  profileImage: string;
  previewVideos: string[];
  galleryImages: string[];
  phoneNumber?: string;
  isVerified: boolean;
  status: VerificationStatus;
  // Technical Measures
  height?: string;
  weight?: string;
  waist?: string;
  bust?: string;
  eyes?: string;
  hair?: string;
  shoeSize?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'model' | 'admin';
  modelId?: string;
}
