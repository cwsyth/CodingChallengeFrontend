import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import { useState, useRef, LegacyRef, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import './Challenges.css';
import ChallengeTableElement from '../../../../interfaces/ChallengeTableElement';
import { ChallengeDescription } from './components/ChallengeDescription';
import { MilkdownProvider } from '@milkdown/react';
import challenge from '../../../../services/challenge';
import toast from '../../../../services/toast';
import { ToastType } from '../../../../interfaces/ToastType';
import Button from '../../../../components/Button/Button';
import { useTranslation } from 'react-i18next';
import { useAGGridLocaleContext } from '../../../../components/Context/AGGridLocaleContext/useAGGridLocaleContext';
import { ICellRendererParams, IRowNode } from 'ag-grid-community';

/**
 * Challenges Page for the admin dashboard.
 * @author Timo Hauser
 *
 * @export
 * @returns {React.ReactNode}
 */
export default function Challenges() {
    // Context
    /**
     * i18next Context
     * @author Matthias Roy
     *
     * @type {TFunction<[string, string], undefined>}
     */
    const { t } = useTranslation(['admin', 'main']);
    /**
     * Grid Locale Context
     * @author David Linhardt
     *
     * @type {AGGridLocale}
     */
    const { gridLocale } = useAGGridLocaleContext();

    // Refs
    /**
     * AG Grid Reference for the Challenge Table
     * @author Timo Hauser
     *
     * @type {LegacyRef<AgGridReact>}
     */
    const gridRef: LegacyRef<AgGridReact> = useRef<AgGridReact>(null);

    // States
    /**
     * Grid Options
     * @author Timo Hauser
     *
     * @type {GridOptions}
     */
    const gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: 10,
        paginationPageSizeSelector: [10, 25, 50, 100],
        rowHeight: 142,
    };
    /**
     * Row Data
     * @author Timo Hauser
     *
     * @type {ChallengeTableElement[]}
     */
    const [rowData, setRowData] = useState<ChallengeTableElement[]>([
        {
            id: 0,
            active: false,
            description: `**solve the math problem** `,
            title: '# Simple Math',
        },
    ]);
    /**
     * New Challenge Title from form input field
     * @author Timo Hauser
     *
     * @type {string}
     */
    const [newTitle, setNewTitle] = useState<string>('');
    /**
     * new Challenge Description from form input field
     * @author Timo Hauser
     *
     * @type {string}
     */
    const [newDescription, setNewDescription] = useState<string>('');

    useEffect(() => {
        let hasBeenExecuted = false;
        /**
         * Fetches all challenges from the backend and sets the rowData state accordingly.
         * @author Timo Hauser
         *
         * @async
         * @returns {void}
         */
        const fetchData = async () => {
            try {
                const res = await challenge.list();
                if (res.ok) {
                    const data = await res.json();
                    setRowData(parseJson(data));
                } else {
                    const data = await res.json();
                    toast.showToast(
                        ToastType.ERROR,
                        toast.httpError(res.status, data.error)
                    );
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    toast.showToast(ToastType.ERROR, err.message);
                }
            }
        };
        if (!hasBeenExecuted) {
            fetchData();
        }
        return () => {
            hasBeenExecuted = true; // Cleanup
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * JSON from Backend for ChallengeItem
     * @author David Linhardt
     *
     * @interface JsonChallengeItem
     * @typedef {JsonChallengeItem}
     */
    interface JsonChallengeItem {
        id: number;
        description: string;
        title: string;
        active: boolean;
    }
    /**
     * Parses the JSON from the backend to the ChallengeTableElement Interface for the rowData state.
     * @author Timo Hauser
     *
     * @param {JsonChallengeItem[]} jsonArray
     * @returns {ChallengeTableElement[]}
     */
    function parseJson(
        jsonArray: JsonChallengeItem[]
    ): ChallengeTableElement[] {
        return jsonArray.map((item) => ({
            id: item.id,
            description: item.description,
            title: item.title,
            active: item.active,
        }));
    }

    /**
     * AG Grid Cell Renderer for the Delete Button in the Challenge Table
     * @author Timo Hauser
     *
     * @param {ICellRendererParams} params
     * @returns {React.ReactNode}
     */
    const deleteButtonRenderer = (params: ICellRendererParams) => (
        <div className="center">
            <Button
                text={t('buttonDelete', { ns: 'main' })}
                handleClick={() =>
                    deleteChallenge(params.node.data.id, params.node.data)
                }
            />
        </div>
    );

    /**
     * AG Grid Cell Renderer for the Description in the Challenge Table
     * @author Timo Hauser
     *
     * @param {ICellRendererParams} params
     * @returns {React.ReactNode}
     */
    const descriptionRenderer = (params: ICellRendererParams) => (
        <>
            <input
                type="text"
                onChange={(e) => handleChangeTitle(params.node.data.id, e)}
                defaultValue={params.node.data.title}
                className="input"
            ></input>
            <br />
            <MilkdownProvider>
                <ChallengeDescription
                    isEditingEnabled={false}
                    onChange={() => null}
                    id={0}
                    description={params.node.data.description}
                />
            </MilkdownProvider>
        </>
    );

    /**
     * AG Grid Cell Renderer for the Active Checkbox in the Challenge Table
     * @author Timo Hauser
     *
     * @param {ICellRendererParams} params
     * @returns {React.ReactNode}
     */
    const activeRenderer = (params: ICellRendererParams) => (
        <>
            <input
                type="checkbox"
                defaultChecked={params.data.active}
                onChange={(e) => setChallengeActive(params.data.id, e)}
            ></input>
        </>
    );

    // Handler for Add Challenge Form
    /**
     * Handles the Add Challenge Form Submission and calls the addChallenge function to add a new challenge to the backend.
     * @author Timo Hauser
     *
     * @param {React.FormEvent<HTMLFormElement>} event
     */
    function handleAddChallenge(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addChallenge();
    }

    /**
     * Handles the Title Input Field Change and sets the newTitle state accordingly.
     * @author Timo Hauser
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event
     */
    function handleTitleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewTitle(event.target.value);
    }

    /**
     * Handles the Description Input Field Change and sets the newDescription state accordingly.
     * @author Timo Hauser
     *
     * @param {string} description
     */
    function handleOnDescriptionChange(description: string) {
        setNewDescription(description);
    }

    /**
     * Handles the Title Input Field Change and calls the changeTitle function to change the title of a challenge in the backend accordingly.
     * @author Timo Hauser
     *
     * @async
     * @param {number} id
     * @param {React.ChangeEvent<HTMLInputElement>} event
     * @returns {void}
     */
    async function handleChangeTitle(
        id: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        try {
            const res: Response = await challenge.changeTitle(
                id,
                event.target.value
            );
            if (!res.ok) {
                const data = await res.json();
                toast.showToast(
                    ToastType.ERROR,
                    toast.httpError(res.status, data.error)
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.showToast(ToastType.ERROR, err.message);
            }
        }
    }

    /**
     * Deletes a challenge from the backend and the rowData state accordingly.
     * @author Timo Hauser
     *
     * @async
     * @param {number} id
     * @param {IRowNode} row
     * @returns {void}
     */
    const deleteChallenge = async (id: number, row: IRowNode) => {
        try {
            const res: Response = await challenge.remove(id);
            if (res.ok) {
                gridRef.current?.api.applyTransactionAsync({ remove: [row] });
                toast.showToast(
                    ToastType.SUCCESS,
                    t('successChallengeDeleted', { id: id })
                );
            } else {
                const data = await res.json();
                toast.showToast(
                    ToastType.ERROR,
                    toast.httpError(res.status, data.error)
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.showToast(ToastType.ERROR, err.message);
            }
        }
    };

    /**
     * Set the active status of a challenge in the backend.
     * @author Timo Hauser
     *
     * @async
     * @param {number} id
     * @param {React.ChangeEvent<HTMLInputElement>} event
     * @returns {void}
     */
    const setChallengeActive = async (
        id: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        try {
            const res: Response = await challenge.setActive(
                id,
                event.target.checked
            );
            if (res.ok) {
                toast.showToast(
                    ToastType.SUCCESS,
                    t('successChallengeActive', { id: id })
                );
            } else {
                const data = await res.json();
                toast.showToast(
                    ToastType.ERROR,
                    toast.httpError(res.status, data.error)
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.showToast(ToastType.ERROR, err.message);
            }
        }
    };

    /**
     * Adds a new challenge to the backend and the rowData state accordingly.
     * @author Timo Hauser
     *
     * @async
     * @returns {void}
     */
    const addChallenge = async () => {
        try {
            const res: Response = await challenge.add(
                newTitle,
                newDescription,
                false
            );
            if (res.ok) {
                interface ChallengeInBackend {
                    title: string;
                    description: string;
                    active: boolean;
                }
                const updatedRowData = rowData;
                const json: ChallengeInBackend = {
                    title: newTitle,
                    description: newDescription,
                    active: false,
                };
                let i = 0;
                let biggestIndex =
                    gridRef.current?.api.getDisplayedRowAtIndex(i)?.data.id;
                while (i + 1 != gridRef.current?.api.getDisplayedRowCount()) {
                    if (
                        gridRef.current?.api.getDisplayedRowAtIndex(i + 1)?.data
                            .id > biggestIndex
                    ) {
                        biggestIndex =
                            gridRef.current?.api.getDisplayedRowAtIndex(i + 1)
                                ?.data.id;
                    }
                    i++;
                }
                const challenge: ChallengeTableElement = {
                    description: json.description,
                    title: json.title,
                    active: json.active,
                    id: biggestIndex + 1,
                };
                updatedRowData.push(challenge);
                setRowData(updatedRowData);
                const transaction = {
                    add: [challenge],
                };
                gridRef.current?.api.applyTransactionAsync(transaction);
            } else {
                const data = await res.json();
                toast.showToast(
                    ToastType.ERROR,
                    toast.httpError(res.status, data.error)
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.showToast(ToastType.ERROR, err.message);
            }
        }
    };

    /**
     * Column Definitions for the Challenge Table in the AG Grid Component
     * @author Timo Hauser
     *
     * @type {ColDef<ChallengeTableElement>[]}
     */
    const [colDefs, setColDefs] = useState<ColDef<ChallengeTableElement>[]>([]);
    useEffect(() => {
        setColDefs([
            {
                headerName: t('tableHeaderId'),
                field: 'id',
                cellDataType: 'number',
                sortable: true,
                editable: false,
                maxWidth: 80,
            },
            {
                headerName: t('tableHeaderActive'),
                field: 'active',
                cellDataType: 'boolean',
                sortable: false,
                editable: true,
                maxWidth: 80,
                cellRenderer: activeRenderer,
            },
            {
                headerName: t('tableHeaderDescription'),
                field: 'description',
                filter: false,
                sortable: false,
                flex: 1,
                autoHeight: true,
                cellRenderer: descriptionRenderer,
            },
            {
                headerName: t('tableHeaderDelete'),
                filter: false,
                sortable: false,
                cellRenderer: deleteButtonRenderer,
            },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t]);

    return (
        <div className="admin-wrapper">
            <h1>{t('challengesTitle')}</h1>
            <div
                className="ag-theme-quartz" // applying the grid theme
                style={{ height: 520, width: 1000 }}
            >
                <AgGridReact
                    key={JSON.stringify(gridLocale)}
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    gridOptions={gridOptions}
                    localeText={gridLocale}
                />
            </div>
            <div className="challenge-mang-form card">
                <div className="user-mang-form-title">{t('addChallenge')}</div>
                <div className="challenge-mang-form-container">
                    <input
                        name="title"
                        type="text"
                        placeholder={t('inputPlaceholderAddChallenge')}
                        onChange={handleTitleOnChange}
                        className="input"
                    />
                    <div className="milkdown-container">
                        <label>{t('labelDescription')}</label>
                       <div className="milkdown-editor">
                        <MilkdownProvider>
                                <ChallengeDescription
                                    isEditingEnabled={true}
                                    onChange={handleOnDescriptionChange}
                                    id={0}
                                    description={''}
                                />
                            </MilkdownProvider>
                       </div>
                    </div>
                    <form onSubmit={handleAddChallenge}>
                        <div className="form-container">
                            <div className="form-submit-section">
                                <Button text={t('addChallenge')} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
