interface NewsItemProps {
  title: string;
}

export const NewsItem = ({ title }: NewsItemProps) => {
  return (
    <div className="py-2">
      <span className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
        • {title}
      </span>
    </div>
  );
};
