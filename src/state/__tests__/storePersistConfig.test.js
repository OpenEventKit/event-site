import { persistConfig } from "../persistConfig";
import { dropTransientUserFlags } from "../persistTransforms";

// The transform only works while the store is actually configured with it:
// unwiring it from the persist config re-breaks rehydrate with every other
// test still green.
describe("persist config", () => {
  it("applies dropTransientUserFlags", () => {
    expect(persistConfig.transforms).toContain(dropTransientUserFlags);
  });
});
