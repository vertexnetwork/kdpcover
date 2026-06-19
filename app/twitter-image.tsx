// Twitter card image = the OG image. Next 16's Turbopack build requires the
// route-segment config (runtime/size/contentType) to be statically declared
// here rather than re-exported from another module, so we re-state them and
// only re-use the renderer as the default export.
import OpengraphImage from "./opengraph-image";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpengraphImage;
