interface IButtons {
 name: string,
 classes: string,
 id: string,
}

const buttons: IButtons[] = [
 {
  name: 'Save entry',
  classes: 'btn btn--primary',
  id: "1",
 },
 {
  name: 'Compare',
  classes: 'btn btn--secondary',
  id: "3",
 },
 {
  name: 'View source',
  classes: 'btn btn--ghost',
  id: "2",
 },
 {
  name: 'Delete',
  classes: 'btn btn--danger',
  id: "4",
 },
 {
  name: 'Disabled',
  classes: 'btn btn--primary',
  id: "5",
 }
]

export function ControlsDemo() {
 return (
  <>
   <div className="flex flex-wrap gap-3 items-center">
    {buttons.map(({ name = '', classes = '', id }) => (
     <button key={id} type="button" className={classes}>{name}</button>
    ))}
   </div>

   <div className="flex flex-wrap gap-3 items-end mt-6">
    <div className="field">
     <label htmlFor="d1">Aircraft model</label>
     <input id="d1" placeholder="e.g. PA-28-181 Archer" />
    </div>
    <span className="tag">Piston single</span>
    <span className="placard">Favourite</span>
   </div>
  </>
 );
}
