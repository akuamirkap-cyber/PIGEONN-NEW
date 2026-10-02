import type { AssetId } from '../voxel/models';
import LandmarkThumbnail from './LandmarkThumbnail';
import PackThumbnail from './PackThumbnail';
import { isPackAsset } from '../voxel/packCatalog';

export default function AssetThumbnail({ asset }: { asset: AssetId }) {
  if (isPackAsset(asset)) return <PackThumbnail asset={asset} />;
  if (asset !== 'konbini' && asset !== 'ramen') return <LandmarkThumbnail asset={asset} />;
  return <svg className="asset-thumbnail" viewBox="0 0 128 94" fill="none" aria-hidden="true">
    <path d="M8 69L70 44L122 69L62 92Z" fill="#d7ded0" />
    <path d="M8 69L62 91V94L8 73Z" fill="#a8b5a2" />
    <path d="M62 91L122 69V73L62 94Z" fill="#879c83" />
    {asset === 'konbini' ? <>
      <path d="M23 39L80 19L108 34L51 54Z" fill="#bec9b9" />
      <path d="M23 39L51 54V79L23 65Z" fill="#e7e4c9" />
      <path d="M51 54L108 34V61L51 79Z" fill="#f3edd7" />
      <path d="M27 46L48 57V70L27 59Z" fill="#92bcb1" />
      <path d="M55 58L79 50V69L55 76Z" fill="#8fbbac" />
      <path d="M83 49L99 43V64L83 69Z" fill="#bed7bd" />
      <path d="M89 47V67M65 55V73" stroke="#f1f1d4" strokeWidth="2" />
      <path d="M21 34L51 49L111 29V39L51 59L21 44Z" fill="#faf4da" />
      <path d="M21 35L51 50L111 30V32L51 52L21 37Z" fill="#ef993d" />
      <path d="M21 39L51 54L111 34V37L51 57L21 42Z" fill="#2d8647" />
      <path d="M21 43L51 58L111 38V39.5L51 59.5L21 44.5Z" fill="#d74d32" />
      <path d="M47 30L96 13V26L47 43Z" fill="#294b39" />
      <path d="M50 31L59 28V38L50 41Z" fill="#fff1ce" />
      <path d="M52 32L57 30V32L55 33V37L53 38V33Z" fill="#e75730" />
      <path d="M63 29L90 20M63 34L90 25" stroke="#e5bd69" strokeWidth="2" />
      <path d="M74 35L76 34V44L74 45Z" fill="#f6f0d7" />
      <path d="M101 54L113 50V72L101 76Z" fill="#d6422c" />
      <path d="M104 57L111 55V65L104 67Z" fill="#c0d8af" />
      <path d="M105 69L111 67" stroke="#583c30" strokeWidth="2" />
      <path d="M18 35L24 37V73L21 74V40L18 39Z" fill="#869e89" />
      <path d="M13 25L28 30V45L13 40Z" fill="#f9f1d6" />
      <path d="M16 29L25 32V34L21 33V39L18 38V32L16 31Z" fill="#ec603a" />
      <path d="M113 40V54M116 36V52" stroke="#b58241" strokeWidth="2" />
      <path d="M108 30L118 33V48L108 45Z" fill="#75a443" />
      <path d="M112 26L120 29V39L112 36Z" fill="#9dbb56" />
    </> : <>
      <path d="M29 35L82 18L109 34L57 52Z" fill="#d9a563" />
      <path d="M29 35L57 52V80L29 65Z" fill="#bb834b" />
      <path d="M57 52L109 34V66L57 81Z" fill="#dba568" />
      <path d="M61 58L81 51V73L61 79Z" fill="#b57a3d" />
      <path d="M64 60L77 55V65L64 70Z" fill="#739786" />
      <path d="M89 49L103 44V64L89 70Z" fill="#68452c" />
      <path d="M23 37L47 6L82 0L116 27L61 47Z" fill="#3d5059" />
      <path d="M47 6L82 0L116 27L99 25L74 4Z" fill="#253b46" />
      <path d="M31 31L87 13M37 23L81 8M43 15L73 5M45 41L65 9M60 36L77 12M75 31L85 16M90 26L94 20" stroke="#718088" strokeWidth="2.5" />
      <path d="M56 51L86 41V55L56 65Z" fill="#db4430" />
      <path d="M64 48V61M74 45V58" stroke="#a32922" strokeWidth="1.2" />
      <path d="M59 53L62 52M68 50L71 49M78 47L82 46" stroke="#fff0ce" strokeWidth="2" />
      <path d="M93 27L104 23V60L93 64Z" fill="#28516a" />
      <path d="M95 30L102 27V57L95 59Z" fill="#de442e" />
      <path d="M97 31V35M97 39V43M97 47V51M100 30V34M100 38V42M100 46V50" stroke="#ffecc0" strokeWidth="2" />
      <path d="M51 50L56 52V59L51 57Z" fill="#f36035" />
      <path d="M30 42L36 45V52L30 49Z" fill="#e5472c" />
      <path d="M62 77L80 71L85 74L67 80Z" fill="#e0ae68" />
      <path d="M65 79V85M80 74V80" stroke="#9c6c38" strokeWidth="2" />
      <path d="M93 75L103 71L100 84L90 88Z" fill="#80582f" />
      <path d="M94 77L101 74L98 82L92 85Z" fill="#355244" />
      <path d="M21 42V72" stroke="#ad7a40" strokeWidth="3" />
      <path d="M16 36L25 39V54L16 51Z" fill="#76a047" />
      <path d="M17 29L24 31V44L17 42Z" fill="#a1bd55" />
    </>}
  </svg>;
}