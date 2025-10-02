import { Avatar, Background, EmotePack, ItemType, StoreItemsResponse } from '@/types/Store';

// Avatars
const avatars: Avatar[] = [
  { id: 1, price: 430, image_path: '/data/avatars/1.png', type: ItemType.AVATAR },
  { id: 2, price: 200, image_path: '/data/avatars/2.png', type: ItemType.AVATAR },
  { id: 3, price: 600, image_path: '/data/avatars/3.png', type: ItemType.AVATAR },
  { id: 4, price: 1100, image_path: '/data/avatars/4.png', type: ItemType.AVATAR },
  { id: 5, price: 410, image_path: '/data/avatars/5.png', type: ItemType.AVATAR },
  { id: 6, price: 1300, image_path: '/data/avatars/6.png', type: ItemType.AVATAR },
  { id: 7, price: 800, image_path: '/data/avatars/7.png', type: ItemType.AVATAR },
  { id: 8, price: 6969, image_path: '/data/avatars/8.png', type: ItemType.AVATAR },
  { id: 9, price: 1100, image_path: '/data/avatars/9.png', type: ItemType.AVATAR },
  { id: 10, price: 2100, image_path: '/data/avatars/10.png', type: ItemType.AVATAR },
  { id: 11, price: 300, image_path: '/data/avatars/11.png', type: ItemType.AVATAR },
  { id: 12, price: 100, image_path: '/data/avatars/12.png', type: ItemType.AVATAR },
  { id: 13, price: 500, image_path: '/data/avatars/13.png', type: ItemType.AVATAR },
  { id: 14, price: 200, image_path: '/data/avatars/14.png', type: ItemType.AVATAR },
  { id: 15, price: 440, image_path: '/data/avatars/15.png', type: ItemType.AVATAR },
  { id: 16, price: 170, image_path: '/data/avatars/16.png', type: ItemType.AVATAR },
  { id: 17, price: 910, image_path: '/data/avatars/17.png', type: ItemType.AVATAR },
  { id: 18, price: 210, image_path: '/data/avatars/18.png', type: ItemType.AVATAR },
  { id: 19, price: 300, image_path: '/data/avatars/19.png', type: ItemType.AVATAR },
  { id: 20, price: 580, image_path: '/data/avatars/20.png', type: ItemType.AVATAR },
];

// Backgrounds
const backgrounds: Background[] = [
  { id: 1, name: 'Gaming', price: 2100, image_path: '/data/backgrounds/bg1.png', type: ItemType.BACKGROUND },
  { id: 2, name: 'Chill', price: 500, image_path: '/data/backgrounds/bg2.png', type: ItemType.BACKGROUND },
  { id: 3, name: 'Neon', price: 1500, image_path: '/data/backgrounds/bg3.png', type: ItemType.BACKGROUND },
  { id: 4, name: 'Ocean', price: 2500, image_path: '/data/backgrounds/bg4.png', type: ItemType.BACKGROUND },
];

const emotePacks: EmotePack[] = [
  { id: 1, name: 'Geometry Pack', price: 500, image_path: '/data/emotes/geometry/preview.png', type: ItemType.EMOTE_PACK },
  { id: 2, name: 'Luna Pack', price: 500, image_path: '/data/emotes/luna/preview.png', type: ItemType.EMOTE_PACK },
  { id: 3, name: 'Sanrio Pack', price: 500, image_path: '/data/emotes/sanrio/preview.png', type: ItemType.EMOTE_PACK },
];

export const storeItems: StoreItemsResponse = {
  avatars,
  backgrounds,
  emote_packs: emotePacks
};

export default storeItems; 