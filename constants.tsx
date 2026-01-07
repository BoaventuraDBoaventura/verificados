
import { Model, VerificationStatus } from './types';

export const MOZAMBIQUE_PROVINCES = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Niassa",
  "Cabo Delgado"
];

export const MOCK_MODELS: Model[] = [
  {
    id: '1',
    artisticName: 'Ana Silva',
    age: 24,
    location: 'Maputo Cidade',
    category: 'Fashion',
    bio: 'Modelo profissional com 5 anos de experiência em fotografia editorial, comercial e passarelas. Especializada em moda praia e fitness.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    previewVideos: ['Video 1', 'Video 2'],
    galleryImages: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop'
    ],
    isVerified: true,
    status: VerificationStatus.APPROVED,
    height: '1.76 m',
    weight: '58 kg',
    waist: '62 cm',
    bust: '88 cm',
    eyes: 'Verdes',
    hair: 'Castanhos',
    shoeSize: '37'
  },
  {
    id: '2',
    artisticName: 'Sarah Jenkins',
    age: 22,
    location: 'Beira, Sofala',
    category: 'Editorial',
    bio: 'Editorial and commercial model with a focus on sustainable fashion brands.',
    profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000&auto=format&fit=crop',
    previewVideos: ['Intro'],
    galleryImages: [],
    isVerified: true,
    status: VerificationStatus.APPROVED,
    height: '1.72 m',
    weight: '54 kg',
    waist: '60 cm',
    bust: '85 cm',
    eyes: 'Castanhos',
    hair: 'Preto',
    shoeSize: '38'
  },
  {
    id: '3',
    artisticName: 'Marcus J.',
    age: 26,
    location: 'Nampula Cidade',
    category: 'Alternative',
    bio: 'Experienced in fitness and activewear modeling.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
    previewVideos: [],
    galleryImages: [],
    isVerified: true,
    status: VerificationStatus.APPROVED,
    height: '1.85 m',
    weight: '82 kg',
    waist: '80 cm',
    bust: '105 cm',
    eyes: 'Pretos',
    hair: 'Careca',
    shoeSize: '42'
  },
  {
    id: '4',
    artisticName: 'Elena R.',
    age: 25,
    location: 'Tete',
    category: 'Runway',
    bio: 'International runway experience.',
    profileImage: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop',
    previewVideos: [],
    galleryImages: [],
    isVerified: true,
    status: VerificationStatus.APPROVED,
    height: '1.78 m',
    weight: '56 kg',
    waist: '59 cm',
    bust: '84 cm',
    eyes: 'Azuis',
    hair: 'Loiro',
    shoeSize: '39'
  }
];
