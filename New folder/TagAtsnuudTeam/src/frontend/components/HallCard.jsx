import { Link } from "react-router-dom";

const moneyFormatter = new Intl.NumberFormat("mn-MN");

const HallCard = ({ hall }) => {
  return (
    <article className="hall-card">
      <img src={hall.imageUrl} alt={hall.name} />
      <div className="hall-card-body">
        <div>
          <h2>{hall.name}</h2>
          <p>{hall.location}</p>
        </div>
        <div className="meta-row">
          <span>{hall.capacity} хүн</span>
          <span>{moneyFormatter.format(hall.pricePerHour)} MNT/цаг</span>
        </div>
        <div className="tag-row">
          {hall.categories.map((category) => (
            <span key={category.id}>{category.name}</span>
          ))}
        </div>
        <Link className="detail-link" to={`/halls/${hall.id}`}>
          Дэлгэрэнгүй
        </Link>
      </div>
    </article>
  );
};

export default HallCard;
