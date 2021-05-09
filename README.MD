# wf-quali-ocr

This is a script that facilitates organizing community events in [Wreckfest](https://order.wreckfestgame.com/). Community events are not officially supported in the game but there are various communities that organize racing events themselves. Events may consist of many races that are sometimes with a separate qualifying part. Handling of the race results is a tedious task usually done by writing lap times and position manually from the result screenshots.

This program aims to facilitate that part by providing tools for extracting qualifying results or race results from the screenshots using OCR (_Optical Character Recognition_) and outputing them into a `.txt` file for simpler further elaboration.

# Requirements

To run the script, you need to have [Node.js](https://nodejs.org/en/) installed on you computer. I developed this with the version `15.3.0`, but it should work with any version that supports `async/await` syntax (ie `>7.6`).

The script uses a free API ([OCR.space(https://ocr.space/)]) for the OCR part, but an API key is required. You can get yourself one from [here](https://ocr.space/OCRAPI). You will have to give them your email and verify it the address. Then they will send the key to your inbox. Check **Installation** chapter below in the instruction for where to put the API key.

---

**Note**
If you absolute do not want to deal with that, contact me on Discord and I can send you the compiled program. You still will need an API key, but you don't need to install Node.

---

# Instructions

## Installation

1. Download Node and install it if you don't have it already.
2. Download the package from GitHub as a ZIP folder to your PC so a location of your preference.
3. Navigate to the folder.
4. Open command prompt / powershell in that folder. You can open powershell by `shift + right clicking` somewhere withing the folder and by selecting `Open Powershell window here`.
5. Run `npm install`
6. Create a new `.txt` file in the script directory called `api_key.txt`.
7. Paste your API key there from your email.

## Usage

1. Before running the script, you need to have 1 or 2 screenshots in the `screenshots` folder. If the event has more than 16 drivers, the result screen becomes scrollable. You need a screenshot starting from the first position and another one starting from the last. The screenshot must be a **full screen** screenshot. Do not crop! By default Steam let's you take screenshots by hitting `F12`. **Currently only 1920x1080 screenshots are supported**.
2. Delete any previous screenshots from the folder. The maximum amount of screenshots allowed is 2, so you can run the script only for one event at a time. In this repository there are already 2 example screenshots in the folder. Feel free to try the functionality with them.
3. To run the script, just click the `run.bat` file in the script directory.
4. Select 1 for quali or 2 for race results. If you are extracting race results, be sure to fill in your point scheme in `points.txt`. First value is the position and second is the point amount separated by a space.
5. Select the program you want to run:
   1. 1=quali: Generates qualification results and server commands with ordered grid. 4 grid positions per message.
   2. 2=race: Generates race results in order
   3. 3=race w/ points: Generates race results with points. One row per driver correctly ordered with driver name and respective points. You must have a `points.txt` file containing you point scheme in place. In `points.txt`, the first value is the position and the second is the point amount separated by a space. Please see the example file in this repo.
   4. 4=event: Generates the final standings sheet of the event based on the data in `results.txt`. Can be used for all events with or without qualification. The output is saved in `event_results.txt` file. The drivers are ordered by the total points. **The race results must be generated with points for this to work**. The precise format of the file is:
      - If `results.txt` contains qualification+race results:
        - name q1 r1 q2 r2 ... q5 r5 p
      - If `results.txt` contains only race results: - name r1 r2 ... r5 p
        The number of qualifications and races depends on how many of them the are in the `results.txt` file. It is not limited.
6. Open the result file, copy the results and paste them where ever you please.
7. ???
8. Profit

Please note that the images in the `output_directory` are removed automatically after the script is completed successfully. Be sure to leave the empty directory there anyway. It's is needed.

Here is a gif animation that illustrates the functionality:
![Script functionality demonstration animation](./__docs__/wf-quali-ocr-guide.gif)

## Building the project

---

**Note**
You need to have `pkg` package installed in order for this to work. It can be installed globally by running `npm install -g pkg`.

---

It is possible to build an `.exe` file of the project. This is done by running `npm run build` in the script folder. Don't worry aobut the warnings prompted during the build saying `Cannot include directory %1 into executable`. These are related to the `sharp` library used for image processing. We need to include those manually by copy-pasteing everything from `X:\**\wf-quali-ocr\node_modules\sharp\build\Release` to `./build` onto the same level with the executable.

You need to add also an `api_key.txt` file in the `build` folder. Without it the script will not work.

Also create `screenshots` and `output_images` folders in the `build` directory. Now, if you have screenshots in the `screenshots` folder, you can run the script by double clicking `wf-quali-ocr.exe`.

That `build` folder you could now move to a different PC and run it without Node or other dependencies installed. They are already bundled in the `.exe`.

## TODO

Now that player list program is there, the string similarity functionality in the program 4 may not be needed anymore, as there should be no differences in driver names in quali and race results.
