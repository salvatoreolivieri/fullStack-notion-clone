"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconPicker {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const IconPicker = ({ asChild, children, onChange }: IconPicker) => {
  const { resolvedTheme } = useTheme();

  const ThemeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };

  const currentTheme = (resolvedTheme || "light") as keyof typeof ThemeMap;

  const theme = ThemeMap[currentTheme];

  return (
    <>
      <Popover>
        <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>

        <PopoverContent className="p-0 w-full border-none shadow-none">
          <EmojiPicker
            height={350}
            theme={theme}
            onEmojiClick={data => onChange(data.emoji)}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};
