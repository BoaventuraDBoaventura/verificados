
export enum VerificationStatus {
  UNVERIFIED = 'Não Verificado',
  PENDING = 'Em Verificação',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado'
}

export interface Model {
  id: string;
  slug?: string;
  artisticName: string;
  email?: string;
  age: number;
  location: string;
  categories: string[];
  bio: string;
  profileImage: string;
  previewVideos: string[];
  galleryImages: string[];
  phoneNumber?: string;
  isVerified: boolean;
  status: VerificationStatus;
  verificationVideo?: string | null;
  services?: { name: string; price: number | string }[];
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
  slug?: string;
}

export interface AdminLog {
  id: string;
  user_name: string;
  action: string;
  type: 'success' | 'payment' | 'danger' | 'info';
  created_at: string;
}
