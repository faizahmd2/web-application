

export function getUrlFromImageId(imageId: string): string {
    const base = process.env.IMGUR_IMG_URL || "https://i.imgur.com/";
    const url = base + imageId;

    return url;
}

export function getImageIdFromUrl(urlString: string): string | undefined {
    const url = new URL(urlString);
    const imageId = url.pathname.split('/').pop();

    return imageId;
}