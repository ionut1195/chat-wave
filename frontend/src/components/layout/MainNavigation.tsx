import { useRecoilValueLoadable } from "recoil";
import { myConversationsQuery } from "../../state/recoil/selectors/MyConversations";

const MainNavigation = () => {
  const itemListLoadable = useRecoilValueLoadable(myConversationsQuery);
  console.log(itemListLoadable);
  switch (itemListLoadable.state) {
    case "hasValue":
      const itemList = itemListLoadable.contents;
      return (
        <div>
          {itemList?.map((item: any) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      );
    case "loading":
      return <div>Loading...</div>;
    case "hasError":
      const error = itemListLoadable.contents;
      return <div>Error: {error.message}</div>;
    default:
      return null;
  }
};

export default MainNavigation;
