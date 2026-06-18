// utils/getCourseVideo.ts

export const getCourseVideo = (
    title: string,
    category?: string
): string => {
    const lower = title.toLowerCase();

    if (
        lower.includes("iphone") ||
        lower.includes("samsung") ||
        lower.includes("oppo") ||
        lower.includes("huawei")
    ) {
        return "obH0Po_RdWk";
    }

    if (
        lower.includes("macbook") ||
        lower.includes("laptop") ||
        lower.includes("inbook")
    ) {
        return "KzdA6VhOg8g";
    }

    if (
        lower.includes("perfume")
    ) {
        return "t4M7xXJ9S4Q";
    }

    return "wsZ_mjXk6Hg";
};