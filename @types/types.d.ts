declare module "*.html" {
    const content: string;
    export default content;
}

interface Window {
    HBBTV_POLYFILL_NS: any;
}
