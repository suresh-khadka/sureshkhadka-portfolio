import { usePyodideContext } from '../context/PyodideContext';

export function usePyodide() {
  return usePyodideContext();
}
