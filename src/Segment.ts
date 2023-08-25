export const identify = (
    userId: string,
    name: string,
    email: string,
    plan?: string
) => {
    // @ts-ignore
    window.analytics.identify(userId, {
        name,
        email,
        plan,
    });
};

export const track = (event: string, object: { [key: string]: string }) => {
    // @ts-ignore
    window.analytics.track(event, object);
};
