
export function lerp(min, max, t) {
    return t * (max - min) + min;
}

export function random(min, max) {
    return lerp(min, max, Math.random());
}

export function clamp(val, min, max) {
    if (val < min)
        return min;
    if (val > max)
        return max;
    return val;
}
