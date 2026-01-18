// src/templates/Registry.js

import RusticTheme from './themes/RusticTheme';
import RusticBohoTheme from './themes/RusticBohoTheme';
import ModernDarkTheme from './themes/ModernDarkTheme';
import BotanicalTheme from './themes/BotanicalTheme';
import MonochromeTheme from './themes/MonochromeTheme';
import NavyGoldTheme from './themes/NavyGoldTheme';
import BohaeminTheme from './themes/BohaeminTheme';
import ElegantTheme from './themes/ElegantTheme';
import JapaneseTheme from './themes/JapaneseTheme';
import JavaneseTheme from './themes/JavaneseTheme';
import LilacTheme from './themes/LilacTheme';
import PlayfulPopTheme from './themes/PlayfulPopTheme';
import StaticCanvasTheme from './themes/StaticCanvasTheme';
import IphoneTheme from './themes/IphoneTheme';
import BitTheme from './themes/BitTheme';
import ComicTheme from './themes/ComicTheme';
import DiaryTheme from './themes/DiaryTheme';
import CloudySkyTheme from './themes/CloudSkyTheme';
import CyberpunkTheme from './themes/CyberPunkTheme';
import CinamonTheme from './themes/CinamonTheme';
import InstaTheme from './themes/InstaTheme';
import HelloKityTheme from './themes/HelloKityTheme';
import MobileTheme from './themes/MobileTheme';
import BinderBookTheme from './themes/BinderTheme';
import ArtGalleryTheme from './themes/ArtTheme';
import ArtBlockTheme from './themes/ArtBlockTheme';

const templates = {
  'rustic-floral': RusticTheme,
  'rustic-boho': RusticBohoTheme,
  'modern-dark': ModernDarkTheme,
  'botanical-gold': BotanicalTheme,
  'monochrome': MonochromeTheme,
  'navy-gold': NavyGoldTheme,
  'bohaemin': BohaeminTheme,
  'elegant-pastel': ElegantTheme,
  'iphone': IphoneTheme,
  'bit': BitTheme,
  'comic': ComicTheme,
  'diary': DiaryTheme,

  // 🔽 NEW THEMES (LOCAL / PREMIUM)
  'japanese': JapaneseTheme,
  'javanese': JavaneseTheme,
  'lilac': LilacTheme,
  'playful-pop': PlayfulPopTheme,
  'static-canvas': StaticCanvasTheme,

  // 🔽 NEW EXPERIMENTAL / VIRAL THEMES
  'cloud-sky': CloudySkyTheme,
  'cyberpunk': CyberpunkTheme,
  'cinamon': CinamonTheme,
  'insta': InstaTheme,
  'hello-kitty': HelloKityTheme,
  'mobile' : MobileTheme,
  'binder-book' : BinderBookTheme,
  'art-gallery' : ArtGalleryTheme,
  'art-block' : ArtBlockTheme,
};


export const getTemplateComponent = (slug) => {
  return templates[slug] || RusticTheme;
};
