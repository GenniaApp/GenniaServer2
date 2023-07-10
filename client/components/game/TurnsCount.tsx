interface TurnsCountProps {
  count: number;
}

function TurnsCount(props: TurnsCountProps) {
  const { count } = props;

  return <div className='TurnsCount'> Turn {Math.floor((count + 1) / 2)} </div>;
}

export default TurnsCount;
