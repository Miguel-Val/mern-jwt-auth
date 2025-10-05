export let navigate = (_path: string, _state: any) => {};

export const setNavigate = (fn: (path: string, state: any) => void) => {
    navigate = fn;
};
