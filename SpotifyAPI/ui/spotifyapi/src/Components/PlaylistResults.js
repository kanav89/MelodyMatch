import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import { HiExternalLink } from "react-icons/hi";

const PlaylistResults = ({ data, isResult, buttonHandler2 }) => {
  return (
    <div className="my-36">
      hi
      {console.log({ data })}
      {isResult}
      {isResult && (
        <Card className="overflow-y-scroll max-h-96 mb-7 mt-16 border-black border-2">
          {data.map((item, index) => (
            <div
              key={index} // Assuming each item has a unique id
              className="text-black"
            >
              {item.track}
              <Badge
                className="max-w-7 cursor-pointer"
                size="sm"
                tabIndex="0"
                role="link"
                aria-label={`Open ${item.track} on Spotify`}
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <HiExternalLink />
                </a>
              </Badge>
            </div>
          ))}
          <Button onClick={buttonHandler2}>Save</Button>
        </Card>
      )}
    </div>
  );
};

export default PlaylistResults;
