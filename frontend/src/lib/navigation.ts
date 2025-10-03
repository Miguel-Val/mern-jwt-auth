export let navigate = (path: string, state: any) => {};

export const setNavigate = (fn: (path: string, state: any) => void) => {
    navigate = fn;
};
