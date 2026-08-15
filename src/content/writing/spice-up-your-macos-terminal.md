---
title: "Spice up your MacOS Terminal"
date: 2024-09-07T00:00:00+05:30
description: "Here are some steps to juice up the boring MacOS terminal using iterm2."
tags: [tech, macos, terminal]
type: Technical
draft: false
---

Here are some steps to juice up the boring MacOS terminal using iTerm2.

## Step 1: Install Homebrew

Run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Step 2: Install iTerm2

Run:

```bash
brew install --cask iterm2
```

## Step 3: Install git

Run:

```bash
brew install git
```

## Step 4: Install oh-my-zsh

Run:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

## Step 5: Install fonts

Download & install:

```bash
https://github.com/Falkor/dotfiles/blob/master/fonts/SourceCodePro%2BPowerline%2BAwesome%2BRegular.ttf
```

## Step 6: Install theme

Run:

```bash
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
```

Set theme on `.zshrc`: `ZSH_THEME="powerlevel10k/powerlevel10k"`

## Step 7: Install custom iTerm2 colors

Copy:

```bash
https://raw.githubusercontent.com/utsavized/iterm2/develop/utsavized.itermcolors
```

Paste contents in a new file somewhere and name it `filename.itermcolors`

## Step 8: Update iTerm2 preferences

- Create new profile, make it default, delete default profile
- Set colors to the newly created itermcolors file
- Set font to SourceCode+PowerLine+AwesomeRegular

## Step 9: Configure Powerlevel10k

Re-launch iTerm2 and follow the prompts

## Step 10: Enable suggestions

Clone:

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

Add plugin to `.zshrc` file: `plugins=(zsh-autosuggestions)`

## Step 11: Configure VS Code

Update `terminal.integrated.fontFamily` setting to `'SourceCodePro+PowerLine+AwesomeRegular'`

## Step 12: Enable quake-style terminal

- Open iTerm2 preferences > keys, then configure hotkey to `Ctrl + ~` to Show/Hide all windows with a system-wide hotkey
- Open iTerm2 preferences > profile > window, set space to all spaces and check hide after opening
- Open system preferences > users & groups > login items, then add iTerm. Check hide.