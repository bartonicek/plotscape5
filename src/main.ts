import { Factor } from "./structs/Factor";

const f1 = Factor.bin([1, 1, 2, 1]);
const f2 = Factor.from(["a", "b", "a", "a"]);

const f3 = Factor.product(f1, f2);

console.log(f3.data().unwrapRows());
