import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";

const data = [
  {
    albumCover:
      "https://img.freepik.com/free-psd/neon-void-cd-cover-template_23-2152015422.jpg?semt=ais_hybrid&w=740&q=80",
    title: "Test",
    ownedBy: "TEST USER",
  },
  {
    albumCover:
      "https://img.freepik.com/free-psd/neon-void-cd-cover-template_23-2152015422.jpg?semt=ais_hybrid&w=740&q=80",
    title: "Test",
    ownedBy: "TEST USER",
  },
  {
    albumCover:
      "https://img.freepik.com/free-psd/neon-void-cd-cover-template_23-2152015422.jpg?semt=ais_hybrid&w=740&q=80",
    title: "Test",
    ownedBy: "TEST USER",
  },
  {
    albumCover:
      "https://img.freepik.com/free-psd/neon-void-cd-cover-template_23-2152015422.jpg?semt=ais_hybrid&w=740&q=80",
    title: "Test",
    ownedBy: "TEST USER",
  },
];

export default function PopularCard() {
  return (
    <div className="px-3 py-2">
      <div className="flex gap-3 items-center">
        <h2>Most Popular Spaces</h2>
        <Link href="#" className="flex gap-2 text-xs ml-auto text-primary">
          <span>See More</span>
        </Link>
      </div>
      <div className="flex items-center justify-between py-2 h-60">
        {data.map((e, idx) => (
          <ImageCardHover
            key={idx}
            imageUrl={e.albumCover}
            title={e.title}
            description={e.ownedBy}
          />
        ))}
      </div>
    </div>
  );
}

interface ImageHoverCardProps {
  imageUrl: string;
  title: string;
  description?: string;
}

function ImageCardHover({ imageUrl, title, description }: ImageHoverCardProps) {
  return (
    <Card className="group h-full justify-center w-1/5 rounded-lg overflow-hidden border-none shadow-md cursor-pointer">
      <AspectRatio ratio={1 / 1} className="relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          // width={1200}
          // height={1024}
          className="object-cover transition-transform duration-500"
          priority={false}
        />

        <div className="absolute h-full w-full inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <CardContent className="text-center text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-white/90">{description}</p>
            )}
          </CardContent>
        </div>
      </AspectRatio>
    </Card>
  );
}
