# mlo-tmc-furni
A NodeJS App for Creating a TMC Furniture Config list from an MLO ytyp. Used for populating Shell interiors with base props.

# Usage:
Supply a ytyp named "ytyp.xml" in the the app's root directory. YTYPs can be exported to XML via Codewalker's RPF Explorer.

Example: `node app.js -r 1 -r 3 -p -x="0.72795407128906" -y="0.72795407128906" -z="0.72795407128906"`

# Arugments:
-r (Default: 1) Room IDs to get props from. Always starts at 1, because room 0 is the shell itself

-p (Default: false) Include Portal objects like Doors

-x -y -z (Default: "0.0") Override Directional Offsets for the props. Usually X and Y are fine, but Z tends to be off.
