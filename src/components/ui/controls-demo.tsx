interface IButtons {
 name: string,
 disabled: boolean,
 classes: string,
 id: string,
}

const buttons: IButtons[] = [
 {
  name: 'Save entry',
  disabled: false,
  classes: 'btn btn--primary',
  id: "1",
 },
 {
  name: 'Compare',
  disabled: false,
  classes: 'btn btn--secondary',
  id: "3",
 },
 {
  name: 'View source',
  disabled: false,
  classes: 'btn btn--ghost',
  id: "2",
 },
 {
  name: 'Delete',
  disabled: false,
  classes: 'btn btn--danger',
  id: "4",
 },
 {
  name: 'Disabled',
  disabled: true,
  classes: 'btn btn--primary',
  id: "5",
 }
]

export function ControlsDemo() {
 return (
  <>
   {/* Button Row */}
   <div className="flex flex-wrap items-center gap-3">
    {buttons.map(({ id, name, classes, disabled }) => (
     <button
      key={id}
      type="button"
      disabled={disabled}
      className={classes}
     >
      {name}
     </button>
    ))}
   </div>

   {/* Field & Metadata Row */}
   <div className="flex flex-wrap items-end gap-3">
    {/* Field Group */}
    <div className="field-group grow sm:grow-0">
     <label htmlFor="d1" className="label">Aircraft model</label>
     <input
      id="d1"
      type="text"
      placeholder="e.g. PA-28-181 Archer"
      className="input"
     />
    </div>
    <span className="badge badge--tag flex items-center h-11">Piston single</span>
    <span className="badge badge--placard flex items-center h-11">Favourite</span>
   </div>
  </>
 );
}
