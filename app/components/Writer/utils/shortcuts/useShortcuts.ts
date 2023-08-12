import { IShortcuts } from '../../interface';
import useCopyPaste from "./useCopyPaste";

function useShortcuts({ ref, editableInfo, ...props }: IShortcuts) {
  useCopyPaste({ ref, editableInfo, ...props });
}

export default useShortcuts;
