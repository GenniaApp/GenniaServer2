interface TurnsCountProps {
  count: number;
}

function TurnsCount(props: TurnsCountProps) {
  const { count } = props;

  return <div className='TurnsCount'> Turn {count} </div>;
}

export default TurnsCount;
