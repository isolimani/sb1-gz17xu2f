'use client';

interface Props {
  categories: string[];
  selectedCategory: string;
  minDelta: number;
  hideNoise: boolean;
  onCategoryChange: (cat: string) => void;
  onMinDeltaChange: (val: number) => void;
  onHideNoiseChange: (val: boolean) => void;
}

export default function FilterBar({
  categories,
  selectedCategory,
  minDelta,
  hideNoise,
  onCategoryChange,
  onMinDeltaChange,
  onHideNoiseChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-white border border-gray-200 rounded-lg px-4 py-3">
      {/* Category */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Min Delta */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Min Signal
        </label>
        <input
          type="range"
          min={0}
          max={40}
          step={5}
          value={Math.round(minDelta * 100)}
          onChange={(e) => onMinDeltaChange(Number(e.target.value) / 100)}
          className="w-24"
        />
        <span className="text-sm font-mono text-gray-700 w-10">{Math.round(minDelta * 100)}%</span>
      </div>

      {/* Hide noise */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hideNoise}
          onChange={(e) => onHideNoiseChange(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm text-gray-600">Hide &lt;10% delta</span>
      </label>
    </div>
  );
}
