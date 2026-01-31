const GridHead = ({icon, title, className}: {icon: any, title: string, className?: string}) => {
  return (
    <div className={`section_head flex items-center mb-4 gap-2 ${className}`}>
      <span className="text-white bg-green size-12 rounded-md flex items-center justify-center">{icon}</span>
      <h2 className="font-bold text-4xl">{title}</h2>
    </div>
  );
}

export default GridHead;