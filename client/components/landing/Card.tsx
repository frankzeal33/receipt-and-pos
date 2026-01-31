
const Card = ({className, children}: {className: string, children: any}) => {
  return (
    <article className={`card ${className}`}>
        {children}
    </article>
  );
}

export default Card;