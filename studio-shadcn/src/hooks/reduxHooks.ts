import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";

// Enhanced hook that returns a Promise-wrapped dispatch function
export const useAppDispatch = () => useDispatch<AppDispatch>();
//   const dispatch = useDispatch<AppDispatch>();

//   // Return a wrapped version of dispatch that returns a Promise
//   return function promiseDispatch<T>(action: any): Promise<T> {
//     const result = dispatch(action);
//     // If the result is already a Promise (from a thunk), return it directly
//     if (result instanceof Promise) {
//       return result;
//     }
//     // Otherwise, wrap the result in a resolved Promise
//     return Promise.resolve(result);
//   };
// };
